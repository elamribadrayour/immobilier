

export const Zipcode = ({item}) => 
{
    console.log(item);
    return(
        <option key={item[0]}>{item[1]}</option>
    );
}

export default Zipcode;