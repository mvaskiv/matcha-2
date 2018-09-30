export default function API(type, data) {
    let BaseURL = '/api.php';
    data.method = type;
    return new Promise((resolve, reject) => {
        fetch(BaseURL, {
            method: 'POST',
            // mode: 'no-cors',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((res) => {
            console.log(res);
            resolve(res);
        })
        .catch((error) => {
            reject(error);
        });
    });
}

export function GEO(coords) {
    let query = coords ? 'https://us1.locationiq.com/v1/reverse.php?key=edf49c52a11d0d&lat=' + coords.lat + '&lon=' + coords.lon + '&zoom=8&format=json' : 'http://ip-api.com/json';
    let result = coords ? 'display_name' : 'city';
    console.log(query);
    return new Promise((resolve, reject) => {
        fetch(query, {
            method: 'POST',
        })   
        .then((response) => response.json())
        .then((res) => {
            resolve(res[result]);
        })
        .catch((error) => {
            reject(error);
        });
    });
}
