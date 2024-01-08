/* import { matchSorter } from "match-sorter"; // Este bloque deja de tener relevancia luego de implementar strapi
// @ts-expect-error - no types, but it's a tiny function
import sortBy from "sort-by";
import invariant from "tiny-invariant"; */

type ContactMutation = {
  id?: string;
  first?: string;
  last?: string;
  avatar?: string;
  twitter?: string;
  notes?: string;
  favorite?: boolean;
};

export type ContactRecord = ContactMutation & {
  id: string;
  createdAt: string;
};

/* const fakeContacts = { // Este bloque deja de tener relevancia luego de implementar strapi
  records: {} as Record<string, ContactRecord>,

  async getAll(): Promise<ContactRecord[]> {
    return Object.keys(fakeContacts.records)
      .map((key) => fakeContacts.records[key])
      .sort(sortBy("-createdAt", "last"));
  },

  async get(id: string): Promise<ContactRecord | null> {
    return fakeContacts.records[id] || null;
  },

  async create(values: ContactMutation): Promise<ContactRecord> {
    const id = values.id || Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();
    const newContact = { id, createdAt, ...values };
    fakeContacts.records[id] = newContact;
    return newContact;
  },

  async set(id: string, values: ContactMutation): Promise<ContactRecord> {
    const contact = await fakeContacts.get(id);
    invariant(contact, `No contact found for ${id}`);
    const updatedContact = { ...contact, ...values };
    fakeContacts.records[id] = updatedContact;
    return updatedContact;
  },

  destroy(id: string): null {
    delete fakeContacts.records[id];
    return null;
  },
}; */

// Fn. intermediaria que permite definir y manejar adecuadamente la estructura (la cual podemos visualizar en ' http://localhost:1337/api/contacts ') que retornamos
// se plantea de forma recursiva
export function flattenAttributes(data : any): any {
  // Caso base
  if(!data) return null;

  // en este contexto ' data ' es un array, entonces procedemos a mapearlo y procesar cada elemento
  if(Array.isArray(data)){
    return data.map(flattenAttributes);
  }

  let flattened: { [key: string]: any } = {};

  // Procesamiento de atributos
  if(data.attributes){
    for(let key in data.attributes){
      if(
        typeof data.attributes[key] === "object" &&
        data.attributes[key] !== null &&
        "data" in data.attributes[key]
      ) {
        flattened[key] = flattenAttributes(data.attributes[key].data);
      } else{
        flattened[key] = data.attributes[key];
      }
    }
  }

  // Copiando propiedades no pertinentes a atributos o bien al objeto ' data ' (obs: revisar mejor)
  for(let key in data){
    if(key !== "attributes" && key !== "data"){
      flattened[key] = data[key];
    }
  }

  // Proceso de datos anidados (first, last, avatar, etc.)
  if(data.data){
    flattened = { ...flattened, ...flattenAttributes(data.data) };
  }

  return flattened;
}

////////////////////////////////////////////////////////////////////////////////
// Handful of helper functions to be called from route loaders and actions
// En las siguientes funciones, cada línea/bloque comentado guarda relación a la *anterior etapa de haber implementado Strapi* (AS), ende al igual que los bloques comentados arriba simplemente se preservan

const url = process.env.STRAPI_URL || "http://127.0.0.1:1337";

export async function getContacts(query?: string | null) {
  // DEF AS
  /* await new Promise((resolve) => setTimeout(resolve, 500));
  let contacts = await fakeContacts.getAll();
  if (query) {
    contacts = matchSorter(contacts, query, {
      keys: ["first", "last"],
    });
  }
  return contacts.sort(sortBy("last", "createdAt")); */ 
  // END AS
  try {
    const response = await fetch(url + "/api/contacts");
    const data = await response.json(); // acá se recibiría el objeto de cada contacto (como lo seteamos en strapi) en formato json
    const flattenAttributesData = flattenAttributes(data.data); // acá, el objeto ' data ', tendrá los datos de contactos, así como los metadatos, por eso accedemos particularmente a la instancia ' data.data '
    return flattenAttributesData;
  } catch (error) {
    console.log(error)
  }
}

export async function createContact(data: any) {
  // DEF AS
  /* const contact = await fakeContacts.create({});
  return contact; */ 
  // END AS
  try {
    const response = await fetch(url + "/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: {...data} })
    }); // Si no pasamos un segundo parámetro a ' fetch() ' indicando el método que deseamos usar, por defecto será una petición ' get '
    const responseData = await response.json(); // acá se recibiría el objeto de cada contacto (como lo seteamos en strapi) en formato json
    const flattenAttributesData = flattenAttributes(responseData.data); // acá, el objeto ' data ', tendrá los datos de contactos, así como los metadatos, por eso accedemos particularmente a la instancia ' data.data '
    return flattenAttributesData;
  } catch (error) {
    console.log(error)
  }
}

export async function getContact(id: string) {
   // return fakeContacts.get(id); AS
   try {
    const response = await fetch(url + "/api/contacts/" + id); // Muy similar a ' getContacts() ', con la diferencia de que para obtener un único contacto concatenamos ' id ', el cual obtenemos como parámetro
    const data = await response.json(); // acá se recibiría el objeto de cada contacto (como lo seteamos en strapi) en formato json
    const flattenAttributesData = flattenAttributes(data.data); // acá, el objeto ' data ', tendrá los datos de contactos, así como los metadatos, por eso accedemos particularmente a la instancia ' data.data '
    return flattenAttributesData;
  } catch (error) {
    console.log(error)
  }
}

export async function updateContact(id: string, updates: ContactMutation) {
  // DEF AS
  /* const contact = await fakeContacts.get(id);
  if (!contact) {
    throw new Error(`No contact found for ${id}`);
  }
  await fakeContacts.set(id, { ...contact, ...updates });
  return contact; */
  // END AS
}

export async function deleteContact(id: string) {
  // fakeContacts.destroy(id); AS
}

const data = [ // variable que usaremos como referencia
  {
    avatar:
      "https://sessionize.com/image/124e-400o400o2-wHVdAuNaxi8KJrgtN3ZKci.jpg",
    first: "Shruti",
    last: "Kapoor",
    twitter: "@shrutikapoor08",
  },
  {
    avatar:
      "https://sessionize.com/image/1940-400o400o2-Enh9dnYmrLYhJSTTPSw3MH.jpg",
    first: "Glenn",
    last: "Reyes",
    twitter: "@glnnrys",
  },
  {
    avatar:
      "https://sessionize.com/image/9273-400o400o2-3tyrUE3HjsCHJLU5aUJCja.jpg",
    first: "Ryan",
    last: "Florence",
  },
  {
    avatar:
      "https://sessionize.com/image/d14d-400o400o2-pyB229HyFPCnUcZhHf3kWS.png",
    first: "Oscar",
    last: "Newman",
    twitter: "@__oscarnewman",
  },
  {
    avatar:
      "https://sessionize.com/image/fd45-400o400o2-fw91uCdGU9hFP334dnyVCr.jpg",
    first: "Michael",
    last: "Jackson",
  },
  {
    avatar:
      "https://sessionize.com/image/b07e-400o400o2-KgNRF3S9sD5ZR4UsG7hG4g.jpg",
    first: "Christopher",
    last: "Chedeau",
    twitter: "@Vjeux",
  },
  {
    avatar:
      "https://sessionize.com/image/262f-400o400o2-UBPQueK3fayaCmsyUc1Ljf.jpg",
    first: "Cameron",
    last: "Matheson",
    twitter: "@cmatheson",
  },
  {
    avatar:
      "https://sessionize.com/image/820b-400o400o2-Ja1KDrBAu5NzYTPLSC3GW8.jpg",
    first: "Brooks",
    last: "Lybrand",
    twitter: "@BrooksLybrand",
  },
  {
    avatar:
      "https://sessionize.com/image/df38-400o400o2-JwbChVUj6V7DwZMc9vJEHc.jpg",
    first: "Alex",
    last: "Anderson",
    twitter: "@ralex1993",
  },
  {
    avatar:
      "https://sessionize.com/image/5578-400o400o2-BMT43t5kd2U1XstaNnM6Ax.jpg",
    first: "Kent C.",
    last: "Dodds",
    twitter: "@kentcdodds",
  },
  {
    avatar:
      "https://sessionize.com/image/c9d5-400o400o2-Sri5qnQmscaJXVB8m3VBgf.jpg",
    first: "Nevi",
    last: "Shah",
    twitter: "@nevikashah",
  },
  {
    avatar:
      "https://sessionize.com/image/2694-400o400o2-MYYTsnszbLKTzyqJV17w2q.png",
    first: "Andrew",
    last: "Petersen",
  },
  {
    avatar:
      "https://sessionize.com/image/907a-400o400o2-9TM2CCmvrw6ttmJiTw4Lz8.jpg",
    first: "Scott",
    last: "Smerchek",
    twitter: "@smerchek",
  },
  {
    avatar:
      "https://sessionize.com/image/08be-400o400o2-WtYGFFR1ZUJHL9tKyVBNPV.jpg",
    first: "Giovanni",
    last: "Benussi",
    twitter: "@giovannibenussi",
  },
  {
    avatar:
      "https://sessionize.com/image/f814-400o400o2-n2ua5nM9qwZA2hiGdr1T7N.jpg",
    first: "Igor",
    last: "Minar",
    twitter: "@IgorMinar",
  },
  {
    avatar:
      "https://sessionize.com/image/fb82-400o400o2-LbvwhTVMrYLDdN3z4iEFMp.jpeg",
    first: "Brandon",
    last: "Kish",
  },
  {
    avatar:
      "https://sessionize.com/image/fcda-400o400o2-XiYRtKK5Dvng5AeyC8PiUA.png",
    first: "Arisa",
    last: "Fukuzaki",
    twitter: "@arisa_dev",
  },
  {
    avatar:
      "https://sessionize.com/image/c8c3-400o400o2-PR5UsgApAVEADZRixV4H8e.jpeg",
    first: "Alexandra",
    last: "Spalato",
    twitter: "@alexadark",
  },
  {
    avatar:
      "https://sessionize.com/image/7594-400o400o2-hWtdCjbdFdLgE2vEXBJtyo.jpg",
    first: "Cat",
    last: "Johnson",
  },
  {
    avatar:
      "https://sessionize.com/image/5636-400o400o2-TWgi8vELMFoB3hB9uPw62d.jpg",
    first: "Ashley",
    last: "Narcisse",
    twitter: "@_darkfadr",
  },
  {
    avatar:
      "https://sessionize.com/image/6aeb-400o400o2-Q5tAiuzKGgzSje9ZsK3Yu5.JPG",
    first: "Edmund",
    last: "Hung",
    twitter: "@_edmundhung",
  },
  {
    avatar:
      "https://sessionize.com/image/30f1-400o400o2-wJBdJ6sFayjKmJycYKoHSe.jpg",
    first: "Clifford",
    last: "Fajardo",
    twitter: "@cliffordfajard0",
  },
  {
    avatar:
      "https://sessionize.com/image/6faa-400o400o2-amseBRDkdg7wSK5tjsFDiG.jpg",
    first: "Erick",
    last: "Tamayo",
    twitter: "@ericktamayo",
  },
  {
    avatar:
      "https://sessionize.com/image/feba-400o400o2-R4GE7eqegJNFf3cQ567obs.jpg",
    first: "Paul",
    last: "Bratslavsky",
    twitter: "@codingthirty",
  },
  {
    avatar:
      "https://sessionize.com/image/c315-400o400o2-spjM5A6VVfVNnQsuwvX3DY.jpg",
    first: "Pedro",
    last: "Cattori",
    twitter: "@pcattori",
  },
  {
    avatar:
      "https://sessionize.com/image/eec1-400o400o2-HkvWKLFqecmFxLwqR9KMRw.jpg",
    first: "Andre",
    last: "Landgraf",
    twitter: "@AndreLandgraf94",
  },
  {
    avatar:
      "https://sessionize.com/image/c73a-400o400o2-4MTaTq6ftC15hqwtqUJmTC.jpg",
    first: "Monica",
    last: "Powell",
    twitter: "@indigitalcolor",
  },
  {
    avatar:
      "https://sessionize.com/image/cef7-400o400o2-KBZUydbjfkfGACQmjbHEvX.jpeg",
    first: "Brian",
    last: "Lee",
    twitter: "@brian_dlee",
  },
  {
    avatar:
      "https://sessionize.com/image/f83b-400o400o2-Pyw3chmeHMxGsNoj3nQmWU.jpg",
    first: "Sean",
    last: "McQuaid",
    twitter: "@SeanMcQuaidCode",
  },
  {
    avatar:
      "https://sessionize.com/image/a9fc-400o400o2-JHBnWZRoxp7QX74Hdac7AZ.jpg",
    first: "Shane",
    last: "Walker",
    twitter: "@swalker326",
  },
  {
    avatar:
      "https://sessionize.com/image/6644-400o400o2-aHnGHb5Pdu3D32MbfrnQbj.jpg",
    first: "Jon",
    last: "Jensen",
    twitter: "@jenseng",
  },
]/* // DEF AS .forEach((contact) => { // pertinente a etapa anterior de haber implementado strapi
  fakeContacts.create({
    ...contact,
    id: `${contact.first.toLowerCase()}-${contact.last.toLocaleLowerCase()}`,
  });
});
 */
// END AS