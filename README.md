# IPv6 [HR]
![Web app](https://github.com/user-attachments/assets/62dc6704-f8c8-49f8-a7d5-a778e1ac2ec4)

[![en](https://img.shields.io/badge/lang-EN-red.svg)](https://github.com/boki01/ipv6-beautifier/blob/main/README.en.md)

## Opis

Internet protokol verzija 6, ili kraće IPv6 je relativno nova verzija internet protokola koja će najvjerojatnije postati sljedeća standardna verzija komunikacijskog protokola. Trenutačno najraširenija verzija je IP verzija 4, ili kraće IPv4. Pojedine verzije internet protokola se razlikuju po načinu adresiranja, izgledu zaglavlja paketa, ali i brojnim drugim detaljima. Najvažnija karakteristika IPv6 je da koristi 128-bitnu IP adresu, tj. propisana duljina svake IP adrese u ovoj verziji protokola je 128 bita.

IPv6 adresa je u osnovi niz od 128 bitova, dakle 128 znakova 0 ili 1. Uobičajeno je da se ti binarni brojevi iz razloga jednostavnosti zapisuju kao osam grupa od po četiri heksadekadske znamenke odvojene dvotočkama.
![IPv6 adresa](https://github.com/user-attachments/assets/6225108e-a1c3-4590-b82a-bda3b20dd267)

Zbog same duljine zapisa, IPv6 adresa se može skraćeno zapisivati po određenim pravilima:
* vodeće nule u polju između dva separatora su opcionalne
* uzastopni niz nula može se prikazati kao dva separatora, pri čemu se :: može upotrijebiti samo jednom u adresi

Ova web aplikacija omogućuje upravo taj proces - skraćivanje IPv6 adrese. 

## Algoritam

Kako bi ostvarili u potpunosti skraćenu IPv6 adresu potrebno je razviti algoritam koji će to i raditi. 

### Provjera unosa
```
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

```
Prije samog algoritma potrebno je provjeriti je li dana adresa valjana. To radi gore navedena funkcija pomoću regularnih izraza i malo logike. 
Regularni izraz `const ipv6Pattern` zapravo sadrži sve potrebno za provjeru izraza same adrese, to uključuje jesu li upotrijebljene heksadecimalne znamenke, sadrži li svaka grupa maksimalno četiri heksadecimalne znamenke, jesu li grupe odvojene dvotočkom, je li upotrijebljen dvostruki separatora u izrazu, ako je - je li upotrijebljen maksimalno jedanput itd.
Nažalost regularni izraz ne može provjeriti je li dvostruki separator upotrijebljen ispravno, zato rabimo slijedeći dio koda:
```
// Dodatni slučaj (ako postoji "::" mora se ispravno koristiti) - provjerava "logiku"
    if (ipv6.includes("::")) {
        const parts = ipv6.split("::");

        const leftGroups = parts[0] ? parts[0].split(":").length : 0; // Ako postoji, svaki dio podijeli na grupe po ":" i vrati broj grupa
        const rightGroups = parts[1] ? parts[1].split(":").length : 0;


        if (leftGroups + rightGroups >= 7) { // Zbroj treba biti manji od 7, Zašto? -Inače bi "::" mijenjao samo jednu ili nijednu grupu nula
            return false; // Previše grupa, "::" nije pravilno iskorišten
        }
    }
```
Ovaj dio koda razdvaja IPv6 adresu na dva dijela - prije i nakon dvostrukog separatora, nadalje svaki dio se dijeli na dodatne grupe, zbroj broja tih grupa mora biti manji od 7 kako bi utvrdili da dvostruki separator doista mijenja minimalno dva niza nula.

### Proširenje adrese

```
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
```
Nakon što smo uspostavili da je IPv6 adresa ispravna, moramo osigurati da se ista nalazi u punom obliku. Znači, ako je IPv6 adresa u bilo kojem obliku skraćena potrebno ju je proširiti. To postižemo gore navedenom funkcijom.
Ako IPv6 adresa ne sadrži dvostruki separator onda je poprilično jednostavno - razdvojimo adresu na grupe te svaku grupu dopunimo s nulama, ali ako sadrži, onda se stvari kompliciraju. 
Tada je potrebno razdvojiti adresu na dva dijela - prije i poslije dvostrukog separatora, potom svaki dio podijeliti na grupe. Nakon što smo to napravili, potrebno je izračunati koliko grupa nedostaje (to su grupe popunjene nulama) danom formulom<br>
`8 - (leftGroups.length + rightGroups.length)`. Poslije je opet poprilično jednostavno - svaku grupu dopunimo nulama, na mjesto dvostrukog separatora stavimo polje nula te sve spojimo s dvotočkama.

### Razdvajanje u grupe i pronalazak najduljeg niza nula

```
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
```
Nakon što zasigurno imamo cijelu adresu, podijeliti ćemo je u grupe. Zatim `for` petljom tražimo najdulji uzastopni niz nula.
Idemo kroz grupe `for` petljom, sve dok ne naletimo do grupe koja sadrži samo nule, tada započinjemo brojati i pohranjujemo početni indeks. Brojimo sve dok slijedeća grupa sadrži isključivo nule. Na kraju usporedimo broj uzastopnih grupa i pronađemo najdulji niz i njegov indeks.

### Uklananje vodećih nula

```
function removeLeadingZeros(item) {
    let i = 0;

    while (item[i] === '0' && i < item.length - 1 /* Zašto -1? -Minimalno jedna znamenka treba ostati, pa čak ako je nula */)
        i++;

    item = item.slice(i);
    return item;
}
```
Budući da nam je svaka grupa string, `while` petljom prolazimo svaki znak sve dok ne naletimo do broja ili zadnje znamenke. Na kraju samo vratimo novi string koji počinje prvom znamenkom koja nije nula (ili zadnjom znamenkom koja je nula) - efektivno smo uklonili vodeće nule.

### Rezultat skraćivanja

```
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
```

*Komentari unutar koda pojašnjavaju svrhu koda*

## Autor
- Borna Štefan
