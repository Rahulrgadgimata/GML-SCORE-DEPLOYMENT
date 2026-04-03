async function check() {
    try {
        const res = await fetch('http://localhost:3000/api/data');
        const data = await res.json();
        console.log('--- API DATA CHECK ---');
        console.log('Teams:', data.teams.length);
        console.log('Matches:', data.matches.length);
        if (data.teams && data.teams[0]) {
            console.log('Example Team:', data.teams[0].name, 'Points:', data.teams[0].points);
        } else {
            console.log('NO TEAMS FOUND');
        }
    } catch (e) {
        console.log('ERROR hitting API:', e.message);
    }
}

check();
