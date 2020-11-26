import './Input.css'; 

const Input = ({id, label, type, unit, value, onChange}) =>
{
  return (
    <div className="Input" >
      <label htmlFor={id}>
        <strong>
          {label} 
        </strong>
      </label>
      <input id={id} type={type} value={value} onChange={onChange}/> 
      <label htmlFor={id}>
        <strong>
           {unit}
        </strong>
      </label>
    </div>);
}


export default Input;