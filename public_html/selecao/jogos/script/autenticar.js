(async () => {
    let session = await fetch('http://localhost:3000/getstatus');
    session = await session.json();
    if(!session){
      window.location.href = 'http://localhost:3000/index.html'
    }
})()