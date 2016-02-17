## The server protocol

Based on json objects

### Expected structure

Client Request:
```
"{
    "command": <command_string>,
    "params": <command_params_array>,
    "correlation": <uuid>
}\0"
```
Server Response:
```
"{
    "error": <error_string>,
    "data": <data_object>,
    "correlation": <request uuid>
}\0"
```

### Notes

 * Correlations are not required but recommended to keep better track of
 the client-server-client communication.

 * If there is an error there can't be data and vise versa.

 * Multiplexing will be accounted later on.
