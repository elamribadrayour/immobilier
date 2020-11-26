import React from "react";
import Papa from "papaparse";

import './Zipcodes.css';
import Zipcode from '../Zipcode/Zipcode'

export const parseInputZipcodes = (text) => 
{
    var output = Papa.parse(text);
    var obj = {};

    for ( var i=1, len=output.data.length; i < len; i++ )
        obj[output.data[i][0]] = output.data[i];
    
    output.data = [];
    for ( var key in obj )
      output.data.push(obj[key]);

    return output;
}

export const Values = ({data}) =>
{   
    return data.data.map(item => <Zipcode item={item}/>);
}

const Zipcodes = ({data, onChange}) =>
{
    return(
        <div className="Zipcodes" >
        <label htmlFor="zipCode">
            <strong>
                {"Zipcode : "}
            </strong>
        </label>
            <select onChange={onChange}><Values data={data}/></select>
        </div>
    );
}

export default Zipcodes;