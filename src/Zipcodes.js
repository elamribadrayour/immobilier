

const Zipcodes = ({data, onChange}) =>
{
    return(
        <div>
            <select onChange={onChange}>{data}</select>
        </div>
    );
}

export default Zipcodes;