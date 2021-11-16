//creating variable for database and sending off request to create budget database

let db;
const request = indexedDB.open("pwaBudget", 1);

request.onupgradeneeded = function (event) {

    const db = event.target.result;

    db.createObjectStore("pending",

        { autoIncrement: true });
};



//checking if app works online

request.onsuccess = function (event) {

    db = event.target.result;


    if (navigator.onLine) {

        validatingData();

    }
};




request.onerror = function (event) {

    //checking for errors and logging them to the console

    console.log(`Request Error: ${event.target.errorCode}`);
};

function saveRecord(record) {

    const transaction = db.transaction(["pending"], "readwrite");

    //accessing the pending store in the shopping mart here
    const store = transaction.objectStore("pending");


    store.add(record);
}

function validatingData() {

    let transaction = db.transaction(["pending"], "readwrite");

    let store = transaction.objectStore("pending");

    const getAll = store.getAll();



    getAll.onsuccess = function () {

        if (getAll.result.length > 0) {
            console.log(getAll.result)

            fetch("/api/transaction/bulk", {

                method: "POST",

                body: JSON.stringify(getAll.result),

                headers: {
                    Accept: "application/json, text/plain, */*",

                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())

                .then(() => {
                    // if it is successful, then open a trasaction on the pending db
                    const transaction = db.transaction(["pending"], "readwrite");

                    //accessing pending shopping mart here
                    const store = transaction.objectStore("pending");


                    store.clear();
                });
        }
    };
}

window.addEventListener("online", validatingData);

//event listener checks if offline comes back to online
