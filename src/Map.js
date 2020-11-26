import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon(
    {
      ...L.Icon.Default.prototype.options,
      iconUrl: icon,
      iconRetinaUrl: iconRetina,
      shadowUrl: iconShadow
    });

L.Marker.prototype.options.icon = DefaultIcon;

