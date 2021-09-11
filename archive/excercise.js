// callback approach

// getCustomer(1, (customer) => {
//     console.log(customer);
//     if (customer.isGold){
//         getMovies((movies) => {
//             console.log(movies);
//             sentMail(customer.email, movies, () => {
//                 console.log("Email Sent..");
//             })
//         })
//     }
// });

// function getCustomer(id, callback){
//     setTimeout(() => {
//         callback({
//             id: 1,
//             name: "kaushal",
//             isGold: true,
//             email: "kaushal@gold.net"
//         })
//     }, 4000);
// }

// function getMovies(callback){
//     setTimeout(() => {
//         callback(['Superman', 'S2', 'S3'])
//     }, 4000);
// }

// function sentMail(email, movies, callback) {
//     setTimeout(() => {
//         callback(console.log(email, movies, 'mail sent'));
//     }, 4000);
// }


// Async-Await/Promise approach
getCustomer(1, (customer) => {
    console.log(customer);
    if (customer.isGold){
        getMovies((movies) => {
            console.log(movies);
            sentMail(customer.email, movies, () => {
                console.log("Email Sent..");
            })
        })
    }
});

function getCustomer(id){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                id: 1,
                name: "kaushal",
                isGold: true,
                email: "kaushal@gold.net"
            })
        }, 4000)
    });
}

function getMovies(){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(['Superman', 'S2', 'S3'])
        }, 4000)    
    });
}

function sendMail(email, movies) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 4000)    
    });
}

async function notifyCustomer() {
    const customer = await getCustomer(1);
    console.log(customer);
    if (customer.isGold){
        const movies = await getMovies()
        console.log(movies)
        await sendMail(customer.email, movies);
        console.log("Email Sent")
    }
}

notifyCustomer();