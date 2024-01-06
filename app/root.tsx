// Este archivo siempre será renderizado primero
import type { LinksFunction } from "@remix-run/node";

import {
  Outlet, // En primer instancia, este componente se utiliza para renderizar la ruta "hija" correspondiente a una ruta "padre"
  Form,
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  json,
  Link,
} from "@remix-run/react";

import appStylesHref from "./app.css";
import { getContacts } from "./data";
import Contact from "./routes/contacts.$contactId";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export async function loader() {  // importamos la fn. "loader" a fin de poder llamar al método getContacts()
  const contacts = await getContacts(); // la fn. "getContacts()" genera un array con datos ficticios para los fines de esta práctica; nótese que se emula el acceso o bien una consulta a una API/db
  return json(contacts) // la fn. "json()" permite retornar el dato como una "response" con los headers adecuados dentro
}

export default function App() {
  const contacts = useLoaderData<typeof loader>(); // Se guarda el array con los datos ficticios a ser iterados 
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Contacts</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search contact"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form>
            <Form method="post">
              <button type="submit">Add</button>
            </Form>
          </div>
          <nav> 
            {contacts.length ? ( // Se reemplaza la lista estática original propuesta, por la siguiente dinámica, finalmente se lleva a cabo el mapeo con cada dato ficticio recuperado
                <ul>             
                  {contacts.map((contact) => ( // obs: a partir de la línea que contiene la etiqueta "Link" se renderiza cada url asociada (de ahí el hecho que cada vez que clickeamos en un contacto diferente, la dirección se actualiza y aparecerá ' https://.../contacts/steve ', ' https://.../contacts/dorian ', etc)
                    <li key={contact.id}> 
                      <Link to={`contacts/${contact.id}`}> 
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                        )}{" "}
                        {contact.favorite ? (
                          <span>★</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <i>No contacts</i>
                </p>
              )} 
          </nav> 
        </div>

        <div id="detail">
          <Outlet/>
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
