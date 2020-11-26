import './Input.css'; 

const Inputs = ({id, label, type, isFocused, value, onChange}) =>
{
  return (
    <div>
      <label htmlFor={id}>
        <strong>
          {label}
        </strong>
      </label>
      <input className="Input" id={id} type={type} value={value} onChange={onChange}/>
      <hr/>
    </div>);
}


export default Input;