Node-Red Nodes for Smartmi humidifier.
zhimi.humidifier.ca1.



Available nodes are:
* miio-humidifier-in: get changes
* miio-humidifier-get: get status of device
* miio-humidifier-out: send command to device



<img src="https://github.com/andreypopov/node-red-contrib-miio-humidifier/blob/master/readme/1.png?raw=true">
<img src="https://github.com/andreypopov/node-red-contrib-miio-humidifier/blob/master/readme/2.png?raw=true">



<b>HomeKit characteristic properties.</b>
```json
{
	"Active": {},
	"CurrentRelativeHumidity" : {},
	"WaterLevel": {},
	"LockPhysicalControls": {},
	"SwingMode": {},
    "CurrentHumidifierDehumidifierState": {
        "validValues": [0, 2]
    },
    "TargetHumidifierDehumidifierState": {
        "validValues": [1]
    }, 
    "RelativeHumidityHumidifierThreshold": {
    	"minValue": 0,
        "maxValue": 100,
        "minStep": 10
    },
    "RotationSpeed": {
        "minValue": 0,
         "maxValue": 100,
         "minStep": 25
    }
}
```
