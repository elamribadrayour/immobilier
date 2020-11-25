import React, { Component } from "react";

import Select from "react-select"
import {FixedSizeList} from "react-window";

const height = 35;

class MenuList extends Component 
{
    render() 
    {
      const { options, children, maxHeight, getValue } = this.props;
      const [value] = getValue();
      const initialOffset = options.indexOf(value) * height;
  
      return (
        <FixedSizeList
          height={maxHeight}
          itemCount={children.length}
          itemSize={height}
          initialScrollOffset={initialOffset}
        >
          {({ index, style }) => <div style={style}>{children[index]}</div>}
        </FixedSizeList>
      );
    }
}

const Zipcodes = ({data, onChange}) =>
{
    return(
        <div>
            <Select onChange={onChange} components={{MenuList}} options={data}/>
        </div>
    );
}

export default Zipcodes;