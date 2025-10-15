function parseUplink(device, payload) {
    var decoded = payload.asJsonObject();
    env.log(decoded);

  // Reading
  if (decoded.rv !== undefined) {
    const sensor1 = device.endpoints.byAddress("1");
    if (sensor1 != null) {
      sensor1.updateVolumeSensorStatus(decoded.rv);
    }
  }

  // Battery
  if (decoded.bv !== undefined) {
    const sensor2 = device.endpoints.byAddress("2");
    if (sensor2 != null) {
      sensor2.updateVoltageSensorStatus(decoded.bv);
    }
  }

    // Valve Status
    if (decoded.vs !== undefined) {
        const sensor3 = device.endpoints.byAddress("3");
        if (sensor3 != null) {
            const position = decoded.vs === 0 ? 0
                        : decoded.vs === 1 ? 100
                        : decoded.vs === 2 ? 90
                        : 100; // default fallback

            sensor3.updateClosureControllerStatus(false, position); // Not moving, just reporting position
        }
    }
  
    // Temperature
    if (decoded.ct !== undefined) {
        const sensor4 = device.endpoints.byAddress("4");
        if (sensor4 != null) {
        sensor4.updateTemperatureSensorStatus(decoded.ct);
        }
    }
}

function buildDownlink(device, endpoint, command, payload) {
  // Configura el payload como tipo 'custom'
  payload.port = 1;
  payload.buildResult = downlinkBuildResult.ok;

  switch (command.type) {
    case commandType.closure:
      switch (command.closure.type) {
        case closureCommandType.close:
          payload.setAsJsonObject({ action: "valve", value: "close" }); // ✅ objeto real
          break;

        case closureCommandType.open:
          payload.setAsJsonObject({ action: "valve", value: "open" });  // ✅ objeto real
          break;

        case closureCommandType.position:
          if (command.closure.position === 0) {
            payload.setAsJsonObject({ action: "valve", value: "close" });
          } else if (command.closure.position === 100) {
            payload.setAsJsonObject({ action: "valve", value: "open" });
          } else {
            payload.setAsJsonObject({ action: "valve", value: "open" }); // para posiciones intermedias
          }
          break;

        default:
          payload.buildResult = downlinkBuildResult.unsupported;
          break;
      }
      break;

    default:
      payload.buildResult = downlinkBuildResult.unsupported;
      break;
  }
}