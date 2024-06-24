const searchbutton=document.querySelector(".search-button");
const cityinput=document.querySelector(".cityinput");
const API_key="39ce7dfa4b068d46f8e3f9cbcb80b546";
const weathercardsdiv=document.querySelector(".weather-cards");
const currentweatherdiv=document.querySelector(".current-weather");
const currentlocation=document.querySelector(".use-current");

const createweathercard=(cityname,weatheritem,index)=>{
    if(index==0){
        return `<div class="details">
                    <h2>${cityname}(${weatheritem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature:${(weatheritem.main.temp-273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatheritem.wind.speed}M/S</h4>
                    <h4>Humidity: ${weatheritem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>${weatheritem.weather[0].description}</h4>
                </div>`
    }
    return `<li class="card">
            <h3>(${weatheritem.dt_txt.split(" ")[0]})</h3>
            <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temp:${(weatheritem.main.temp-273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatheritem.wind.speed}M/S</h4>
            <h4>Humidity: ${weatheritem.main.humidity}%</h4>
        </li>`;
}


const getweather=(cityname,lat,lon)=>{
    const weather_url=`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;
    fetch(weather_url).then(res=>res.json()).then(data=>{
        const uniqueforecastdays=[];
        const fivedays=data.list.filter(forecast=>{
            const forecastdate=new Date(forecast.dt_txt).getDate();
            if(!uniqueforecastdays.includes(forecastdate)){
                return uniqueforecastdays.push(forecastdate);
            }
        });
        cityinput.value=" ";
        weathercardsdiv.innerHTML=" ";
        currentweatherdiv.innerHTML=" ";

        fivedays.forEach((weatheritem,index)=>{
            if(index==0){
                currentweatherdiv.insertAdjacentHTML("beforeend",createweathercard(cityname,weatheritem,index));
            }else{
                weathercardsdiv.insertAdjacentHTML("beforeend",createweathercard(cityname,weatheritem,index));
            }
            
        });
    }).catch(()=>{
        alert("An error occurred while fetching the weather forecast!");
    });
}
const getgeo = () => {
   const cityname=cityinput.value.trim();
   if(!cityname) return;
   const geocodingurl=`https://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${API_key}`;
   fetch(geocodingurl).then(res=>res.json()).then(data=>{
     console.log(data);
     if(!data.length) return alert(`No coordinates found for ${cityname}`);
     const {name,lat,lon}=data[0];
     getweather(name,lat,lon);
   }).catch(()=>{
    alert("An error occurred while fetching the coordinates!");
   });
}

const getuser=()=>{
    navigator.geolocation.getCurrentPosition(
        position=>{
            const{latitude,longitude}=position.coords;
            const reverse_geocoding_url=`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_key}`;
            fetch(reverse_geocoding_url).then(res=>res.json()).then(data=>{
                const {name}=data[0];
                getweather(name,latitude,longitude);
              }).catch(()=>{
               alert("An error occurred while fetching the coordinates!");
              });
        },
        error=>{
            if(error.code===error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again");
            }
        }
    )
}
searchbutton.addEventListener("click",getgeo);
currentlocation.addEventListener("click",getuser);
cityinput.addEventListener("keyup",e=>e.key==="Enter" &&getgeo());
