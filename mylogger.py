import os
import sys
import logging
import traceback
import subprocess
from time import time
from pathlib import Path
from logging import config
from datetime import datetime

MONITORING = 9
logging.addLevelName(MONITORING, "MONITORING")

def _DummyFn(*args, **kwargs):
    """
    Placeholder function.
    """
    _, _ = args, kwargs
    raise NotImplementedError()

_srcfile = os.path.normcase(_DummyFn.__code__.co_filename)

if hasattr(sys, '_getframe'):
    # noinspection PyProtectedMember
    # noinspection PySetFunctionToLiteral
    currentframe = lambda: sys._getframe(3)
else:  # pragma: no cover
    def currentframe():
        """Return the frame object for the caller's stack frame."""
        # noinspection PyBroadException
        try:
            raise Exception
        except Exception:
            return sys.exc_info()[2].tb_frame.f_back


class MyLogger(logging.Logger):
    """
    Logger overload that integrates multiple parameters to the message
    and creates a monitoring type of logs
    """

    def __init__(self, name, level=logging.NOTSET):
        """
        MyLogger initializer
        """
        super(MyLogger, self).__init__(name, level)

    def findCaller(self, stack_info=False, stacklevel=1):
        """
        Find the stack frame of the caller so that we can note the source
        file name, line number and function name.
        Due to the overload of Logger, this function needs to be overloaded
        to get the function name one level upper that expected.
        """
        f = currentframe()
        # On some versions of IronPython, currentframe() returns None if
        # IronPython isn't run with -X:Frames.
        if f is not None:
            f = f.f_back
        orig_f = f
        while f and stacklevel > 1:
            f = f.f_back
            stacklevel -= 1
        if not f:
            f = orig_f
        rv = "(unknown file)", 0, "(unknown function)", None
        while hasattr(f, "f_code"):
            co = f.f_code
            filename = os.path.normcase(co.co_filename)
            # noinspection PyProtectedMember
            # noinspection PyUnresolvedReferences
            if filename == _srcfile or filename == logging._srcfile:
                f = f.f_back
                continue
            sinfo = None
            if stack_info:
                sio = io.StringIO()
                sio.write('Stack (most recent call last):\n')
                traceback.print_stack(f, file=sio)
                sinfo = sio.getvalue()
                if sinfo[-1] == '\n':
                    sinfo = sinfo[:-1]
                sio.close()
            rv = (os.path.basename(co.co_filename), f.f_lineno, co.co_name, sinfo)
            break
        return rv

    # noinspection PyMethodMayBeStatic
    def time(self):
        """
        time returns current time in GMT 0
        Time is set into ELK format with :
        * T in place of space
        * Seconds and milliseconds
        """
        (dt, micro) = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f').split('.')
        dt = "%s.%03d" % (dt, int(micro) / 1000)
        dt = str(dt).replace(' ', 'T') + "Z"
        return dt

    # noinspection PyMethodMayBeStatic
    def tags(self, dictionary=None):
        """
        Creates tags as a json string
        """
        #    return "{\"FILE\":\"import_csv\",\"CONTRAT\":\"12345\"}"
        if dictionary is not None:
            length = len(dictionary)
            output = "{"
            for i, (key, value) in enumerate(dictionary.items()):
                output += f"\"{key}\":\"{value}\""
                if i < length - 1:
                    output += ","
            output += "}"
            return output
        else:
            return ""

    # noinspection PyMethodMayBeStatic
    def escape_string(self, message=None):
        """
        Formats message so that it doesn't contain:
        * semicolons because the output log is a csv
        * withe spaces at the end and the beginning of the string
        * \n \t \r

        TO DO :
        * Vérifier les guillements et remplacer par des quotes simples ou guillements, tester les deux options
        """
        if message is not None:
            try :
                output = str(message)
                return output.rstrip().replace(';', ',').replace("\n", "").replace("\t", "").replace("\r", "")
            except :
                return ""
        else:
            return ""

    def concatenate_tags(self, input_tags, caller):
        """
        Formatting tags depending on log level
        """
        output = {}
        if input_tags is not None :
            output.update(input_tags)
        if caller is not None :
            output.update(caller)
        return output

    def format_message(self, level, msg, category=None,
                       input_tags=None, error_message=None):
        """
        The function formats the output message using the set of parameters
        * Handles empty values
        * Adds the function name, the line and the filename if the message is of DEBUG, MONITORING or ERROR level
        """

        try:
            fn, lno, func, sinfo = self.findCaller()
        except ValueError:
            fn, lno, func = "(unknown file)", 0, "(unknown function)"
        caller = {"FILENAME": fn, "LINE": lno, "FUNCTION": func}
        all_tags = self.concatenate_tags(input_tags, caller)

        formatted_message = logging.getLevelName(level) + f";"
        formatted_message += f"{self.time()};"
        formatted_message += f"{category};" if category is not None else f"NULL;"
        formatted_message += f"{self.escape_string(msg)};"
        formatted_message += f"{self.tags(all_tags)};" if all_tags is not None else "{};"
        formatted_message += f"{self.escape_string(error_message)}" if error_message is not None else "NULL"

        return formatted_message

    def logkwargs(self, kwargs):
        output = dict(kwargs)
        output.pop("category", None)
        output.pop("tags", None)
        output.pop("error_message", None)
        return output

    def warning(self, msg, *args, **kwargs):
        """
        Sets a warning message
        """
        message = ""
        if self.isEnabledFor(logging.WARNING):
            message = self.format_message(logging.WARNING, msg, kwargs.get("category"),
                                          kwargs.get("tags"))
        return logging.Logger.warning(self, message, *args, **self.logkwargs(kwargs))

    def error(self, msg, *args, **kwargs):
        '''
        Sets an error message
        '''
        message = ""
        if self.isEnabledFor(logging.ERROR):
            message = self.format_message(logging.ERROR, msg, kwargs.get("category"),
                                          kwargs.get("tags"), kwargs.get("error_message"))
        return logging.Logger.error(self, message, *args, **self.logkwargs(kwargs))

    def info(self, msg, *args, **kwargs):
        """
        Sets an info message
        """
        message = ""
        if self.isEnabledFor(logging.INFO):
            message = self.format_message(logging.INFO, msg, kwargs.get("category"),
                                          kwargs.get("tags"))
        return logging.Logger.info(self, message, *args, **self.logkwargs(kwargs))

    def monitoring(self, delay, function_name, *args, **kwargs):
        """
        Sets a monitoring message which is an info message with a delay of the function_name
        Imposes :
        * Level : "INFO"
        * Message : function_name
        * tags : Add DELAY
        * Category : MONITORING
        """
        message = ""
        if self.isEnabledFor(logging.INFO):
            message = self.format_message(MONITORING, function_name, None, "MONITORING", None, None,
                                          {"DELAY": str(delay)})
        return logging.Logger.info(self, message, *args, **self.logkwargs(kwargs))

    def debug(self, msg, *args, **kwargs):
        """
        Sets an debug message
        """
        message = ""
        if self.isEnabledFor(logging.DEBUG):
            message = self.format_message(logging.DEBUG, msg, kwargs.get("category"),
                                          kwargs.get("tags"))
        return logging.Logger.debug(self, message, *args, **self.logkwargs(kwargs))


logging.setLoggerClass(MyLogger)
logging.config.fileConfig("logging.cfg")
logger = logging.getLogger("My Logger")
