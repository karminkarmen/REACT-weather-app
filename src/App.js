import React from 'react';
import {geolocated} from 'react-geolocated';
import Titles from './components/titles.js';
import Form from './components/form.js';
import Weather from './components/weather.js';
import WeatherIcon from './components/weathericon.js';
import ColorConfig from './color-config.json';
import 'semantic-ui/dist/semantic.min.css';

const API_KEY = '508155ef4249c57e5797af40d9282d00';

class App extends React.Component {
  state = {
    temperature: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: undefined,
    info: undefined,
    bgColor: undefined,
    loader: true,
  };

  componentWillReceiveProps (nextProps) {
    this.getGeoWeather (nextProps);
  }

  setColor = () => {
    const icon = this.state.icon;
    const temp = this.state.temperature;

    let color = this.getColorFromConfig (temp, icon);

    this.setState ({
      bgColor: color,
    });
  };

  getColorFromConfig = (temp, icon) => {
    for (let c of ColorConfig) {
      if (
        (c.temp.min === undefined || temp >= c.temp.min) &&
        (c.temp.max === undefined || temp < c.temp.max) &&
        (!c.icon.length || c.icon.includes (icon))
      ) {
        return c.color;
      }
    }
    return null;
  };

  getWeather = async e => {
    e.preventDefault ();
    const location = e.target.elements.location.value;
    if (!location) {
      this.setState ({
        info: 'Please input location',
      });
      return;
    }
    const api_call = await fetch (
      `//api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
    );
    const data = await api_call.json ();
    if (!data.main) {
      this.setState ({
        info: 'Location not found',
      });
      return;
    }
    this.setState ({
      temperature: data.main.temp,
      city: data.name,
      country: data.sys.country,
      humidity: data.main.humidity,
      icon: data.weather[0].icon,
      description: data.weather[0].description,
      info: '',
      loader: false,
    });
    this.setColor ();
  };

  getGeoWeather = async ({
    coords,
    isGeolocationEnabled,
    isGeolocationAvailable,
  }) => {
    const lat = coords ? coords.latitude : 52.2297;
    const lon = coords ? coords.longitude : 21.0122;

    const geoloc_api_call = await fetch (
      `//api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const data = await geoloc_api_call.json ();

    if (isGeolocationAvailable) {
      this.setState ({
        temperature: data.main.temp,
        city: data.name,
        country: data.sys.country,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        info: '',
        loader: false,
      });
    } else if (!isGeolocationEnabled) {
      this.setState ({
        info: 'Geolocation is not enabled',
      });
    } else {
      this.setState ({
        info: 'Your browser does not support Geolocation',
      });
    }
    this.setColor ();
  };

  render () {
    const css = {backgroundColor: this.state.bgColor};
    return (
      <div style={css} id="background-block">
        <div className="ui container">
          <Titles />
          <div className="ui one column doubling stackable grid container">
            <WeatherIcon icon={this.state.icon} />
            <Weather
              temperature={this.state.temperature}
              city={this.state.city}
              country={this.state.country}
              humidity={this.state.humidity}
              description={this.state.description}
              icon={this.state.icon}
            />
            {this.state.loader
              ? <div class="ui active inverted dimmer">
                  <div class="ui text loader">Loading</div>
                </div>
              : null}
          </div>
          <div className="ui one column doubling stackable grid container">
            <Form getWeather={this.getWeather} info={this.state.info} />
          </div>
        </div>
      </div>
    );
  }
}

export default geolocated () (App);
