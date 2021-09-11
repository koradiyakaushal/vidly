
// async version
// function callbackexmaple(user, callback){
//     setTimeout(() => {
//         console.log(user)
//         callback(1)
//     }, 2000);
// }

// callbackexmaple("testuser", (id) => {
//     console.log(id);
// })

//sync version
// callbackexmaple('testuser')


const p = new Promise((resolve, reject) => {
    // async work
    // ...
    setTimeout(() => {
        // resolve(1);
        reject(new Error('message'));
    }, 2000);

})

p
    .then(result => console.log(result))
    .catch(err => console.log('Error', err.message));

// Callback-based approach
//
// getUser(1, (user) => {
//   getRepositories(user.gitHubUsername, (repos) => {
//     getCommits(repos[0], (commits) => {
//       console.log(commits);
//     })
//   })
// });

function getUser(id) {
    return new Promise((resolve, reject) => {
      // Kick off some async work 
      setTimeout(() => {
        console.log('Reading a user from a database...');
        resolve({ id: id, gitHubUsername: 'mosh' });
      }, 2000);
    });
}
  
function getRepositories(username) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
        console.log('Calling GitHub API...');
        resolve(['repo1', 'repo2', 'repo3']);
        }, 2000);  
    });
}

function getCommits(repo) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
        console.log('Calling GitHub API...');
        resolve(['commit']);
        }, 2000);
    });
}

const p2 = getUser(1);
p2.then(user => getRepositories(user.gitHubUsername))
    .then(repos => getCommits(repos[0]))
    .then(commits => console.log(commits))
    .catch(err => console.log(err.message));


// async and await approach
async function displaycommits() {
    const user = await getUser(1);
    const repos = await getRepositories(user.gitHubUsername);
    const commits = await getCommits(resos[1]);
    console.log(commits);
}
displaycommits();


const p3 = Promise.resolve({id: 1});
p3.then(result => console.log(result));

Promise.all([p2, p3])
    .then(result => console.log(result));
