beforeEach(() => {
    console.log('\n[Test Starting]');
  });
  
  afterEach(() => {
    console.log('\n[Test Ending]');
  });
  
  // Enhanced debug logging
  afterAll(() => {
    const handles = process._getActiveHandles();
    console.log('\n[Active Handles Details]');
    handles.forEach((handle, i) => {
      console.log(`\nHandle ${i}:`);
      if (handle instanceof require('net').Server) {
        console.log('Type: Net Server');
        console.log('Connections:', handle.connections);
      } else if (handle instanceof require('net').Socket) {
        console.log('Type: Net Socket');
        console.log('Connected:', handle.connected);
        console.log('Pending:', handle.pending);
        console.log('Remote address:', handle.remoteAddress);
        console.log('Local address:', handle.localAddress);
      } else {
        console.log('Type:', handle.constructor.name);
      }
    });
  
    const requests = process._getActiveRequests();
    console.log('\n[Active Requests Details]');
    requests.forEach((req, i) => {
      console.log(`Request ${i}:`, req.constructor.name);
    });
  });