function beautify() {
    const result = document.getElementById('result');
    result.innerHTML = null;
    result.style.display = 'block';
    result.offsetHeight; // reflow - za animaciju

    try { // Upotreba try, catch, finally zbog lakšeg error handlinga
        const input = document.getElementById('ipv6Input');
        let ipv6Address = input.value.toLowerCase().trim();

        if (ipv6Address.length === 0)
            throw "Unesite IPv6 adresu";


        if (!validateIPv6(ipv6Address))
            throw "Neispravna adresa";


        // Pretvara sve skraćene formate (uključujući ::) u osam grupa od po četiri heksadecimalne znamenke
        const expandedAddress = expandIPv6(ipv6Address);

        // Razdvajanje u grupe
        let groups = expandedAddress.split(':');

        // Pronalazak najduljeg niza nula
        let maxZeros = 0;           // Duljina najduljeg pronađenog niza
        let maxZerosIndex = -1;     // Početna pozicija najduljeg niza
        let currentZeros = 0;
        let currentIndex = -1;

        for (let i = 0; i < groups.length; i++) {
            if (groups[i] === '0000') { // Broji uzastopne nule
                if (currentIndex === -1) { // Početak niza nula
                    currentIndex = i;
                }
                currentZeros++;
                continue;
            }

            // Više nema uzastopnih nula - kraj niza
            if (currentZeros > maxZeros) {
                maxZeros = currentZeros;
                maxZerosIndex = currentIndex;
            }

            currentZeros = 0;
            currentIndex = -1;

        }

        // Zadnji niz nula
        if (currentZeros > maxZeros) {
            maxZeros = currentZeros;
            maxZerosIndex = currentIndex;
        }

        // Uklananje vodećih nula
        groups = groups.map(removeLeadingZeros);

        // Ako je pronađen niz duljine >= 2, potrebno ga je zamijeniti s "::", ovaj dio koda zamjenjuje taj niz nula s praznim stringom
        if (maxZeros >= 2) {

            groups.splice(maxZerosIndex, maxZeros, '');

            // Posebni slučajevi - na početku i kraju adrese
            // Budući da smo zamjenili niz nula s praznim stringom, potrebno je dodati prazan niz na početku i/ili kraju kak bi nadolazeće spajanje stringova bilo uspješno

            // npr. ako imamo ipv6 "0:0:0:0:0:0:0:0", grupe su slijedeće ["0","0","0","0","0","0","0","0"] mi smo te grupe zamjenili s [""], stoga je potrebno dodati na početku i na
            // kraju "" kako bi dobili ["","",""] te kako bi spojeni string izgledao "::"

            if (maxZerosIndex === 0)
                groups.unshift('');

            if (maxZerosIndex + maxZeros === 8)
                groups.push('');

        }

        // Spajanje grupa
        const shortenedAddress = groups.join(':');

        result.innerHTML = `
            <p>IPv6 Adresa:<br> ${expandedAddress}</p>
            <p>Skraćena IPv6 Adresa:<br>${shortenedAddress}</p>
        `;

    } catch (err) {
        result.innerHTML = "<p style='color:var(--error)'>" + err + "</p>";
    } finally {
        result.classList.add('visible');
    }
}

function validateIPv6(ipv6) {
    const ipv6Pattern = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){0,7}:|:(?::[0-9a-fA-F]{1,4}){1,7}|::|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:))$/;

    if (!ipv6Pattern.test(ipv6)) { // Provjerava "sintaksu"
        return false;
    }

    // Dodatni slučaj (ako postoji "::" mora se ispravno koristiti) - provjerava "logiku"
    if (ipv6.includes("::")) {
        const parts = ipv6.split("::");

        const leftGroups = parts[0] ? parts[0].split(":").length : 0; // Ako postoji, svaki dio podijeli na grupe po ":" i vrati broj grupa
        const rightGroups = parts[1] ? parts[1].split(":").length : 0;


        if (leftGroups + rightGroups >= 7) { // Zbroj treba biti manji od 7, Zašto? -Inače bi "::" mijenjao samo jednu ili nijednu grupu nula
            return false; // Previše grupa, "::" nije pravilno iskorišten
        }
    }

    return true;
}

function removeLeadingZeros(item) {
    let i = 0;

    while (item[i] === '0' && i < item.length - 1 /* Zašto -1? -Minimalno jedna znamenka treba ostati, pa čak ako je nula */)
        i++;

    item = item.slice(i);
    return item;
}

function expandIPv6(address) {
    if (!address.includes('::')) {
        // Dopuni svaku grupu s '0'
        return address.split(':')
            .map(g => g.padStart(4, '0'))
            .join(':');
    }

    let parts = address.split('::');
    let leftGroups = parts[0] ? parts[0].split(':') : []; // Ako postoji, svaki dio podijeli na grupe po ":"
    let rightGroups = parts[1] ? parts[1].split(':') : [];

    // Koliko grupa nula treba dodati (8 grupa je sveukupno koliko adresa treba imati) => 8 - iskoršten broj grupa
    let missingGroups = 8 - (leftGroups.length + rightGroups.length);

    let zeros = Array(missingGroups).fill('0000');

    // Dopuni sve grupe
    leftGroups = leftGroups.map(g => g.padStart(4, '0'));
    rightGroups = rightGroups.map(g => g.padStart(4, '0'));

    return [...leftGroups, ...zeros, ...rightGroups].join(':');
}