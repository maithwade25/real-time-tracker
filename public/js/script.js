const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
        const {latitude, longitude} = position.coords;
        socket.emit("send-location", {latitude, longitude});
    }, 
    (error) => {
        console.error(error);
    },
    { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    }
    );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© Maithili Wade"
}).addTo(map);

const markers = {};


socket.on("receive-location", (data) => {
    const {id, latitude, longitude} = data;
    console.log("Received location", data); // 

    map.setView([latitude, longitude], 10);
    console.log("Set view to", latitude, longitude);// 

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        console.log(`updated marker for user ${id} to new location: [${latitude}, ${longitude}]`); // 
    }
    else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
        console.log(`Added new marker for user ${id} at location: [${latitude}, ${longitude}]`); //
    }
});

socket.on("user-disconnected", (id) => {
    if(markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
        console.log(`Removed marker for user ${id}`); //
    } else {
        console.log(`No marker found for user ${id} to remove`); //
    }
});

