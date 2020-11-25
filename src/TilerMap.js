
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker';
import Overlay from 'pigeon-overlay';

const maptile_access_token = 'ymmI1cqwKf2qLABjIUWX'
const map_id = 'fr-streets-2154'

function mapTilerProvider (x, y, z, dpr) 
{
  return `https://api.maptiler.com/maps/${map_id}/256/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}.png?key=${maptile_access_token}`
}

const TilerMap = (
  <Map provider={mapTilerProvider} dprs={[1, 2]} center={[50.879, 4.6997]} zoom={12} width={600} height={400}>
    <Marker anchor={[50.874, 4.6947]} payload={1} onClick={({ event, anchor, payload }) => {}} />

    <Overlay anchor={[50.879, 4.6997]} offset={[120, 79]}>
      <img src='pigeon.jfif' width={240} height={158} alt='' />
    </Overlay>
  </Map>
)

export default TilerMap;