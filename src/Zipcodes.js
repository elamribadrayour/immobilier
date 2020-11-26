import React, { Component } from "react";

import Papa from "papaparse";

import './Zipcodes.css'; 

export const formatZipcodes = (input) =>
{   
  return input.data.map(item => <option key={item[0]}>{item[1]}</option>);
}

export const parseInputZipcodes = (text) => 
{
    var output = Papa.parse(text);
    output.data.sort(function(a, b) 
    {
      return a[2] - b[2];
    })

    var obj = {};

    for ( var i=0, len=output.data.length; i < len; i++ )
        obj[output.data[i][0]] = output.data[i];
    
    output.data = [];
    for ( var key in obj )
      output.data.push(obj[key]);

    return output;
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
            <select onChange={onChange}>{data}</select>
        </div>
    );
}

export default Zipcodes;