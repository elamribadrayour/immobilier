
const Input = ({id, label, type, isFocused, value, onChange}) =>
{
  return (
    <div>
      <label htmlFor={id}>
        <strong>
          {label}
        </strong>
      </label>
      <input id={id} type={type} value={value} onChange={onChange}/>
      <hr/>
    </div>);
}


export default Input;