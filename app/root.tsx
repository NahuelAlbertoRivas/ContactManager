// Este archivo siempre será renderizado primero
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

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
  useRouteError,
  isRouteErrorResponse,
  useSubmit,
  useNavigation,
  NavLink
} from "@remix-run/react";

import appStylesHref from "./app.css";
import { getContacts } from "./data.server";
// import Contact from "./routes/contacts.$contactId"; // sin efecto luego de implementar strapi
import { useEffect } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export async function loader( { request } : LoaderFunctionArgs ) {  // esta fn. se encargará de llamar al método getContacts() una vez se produzca el evento sobre el objeto en que se haya definido -adrede, o bien éste adquiera ' get ' por defecto (caso del ' search-form ')-, entonces se mostrarán los contactos en la sidebar; algo a tener en cuenta, es la propiedad ' pagination ' de Strapi (en los metadatos lo encontramos como ' pageSize '), por defecto, se muestran los primeros 25 ítems
  const url = new URL(request.url); // obs: ' url ' contiene toda una secuencia de metadatos, donde encontramos un campo llamado ' searchParams ', el cual es el que queremos acceder
  const q = url.searchParams.get("q"); // nótese que ' q ' (la clave) coincide con el identificador que le pusimos al input del ' search-form '
  const contacts = await getContacts(q); // la fn. "getContacts()" genera un array con datos ficticios para los fines de esta práctica; nótese que se emula el acceso o bien una consulta a una API/db
  return json({ contacts, q }) // la fn. "json()" permite retornar el dato como una "response" con los headers adecuados dentro
} // al retornar además ' q ', podemos recibir este valor en ' App() ' para luego setearlo por defecto en el ' search-form ', y que produzca una sincronización entre la entrada de búsqueda y el link de navegación

export function ErrorBoundary(){
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body className="root-error">
        <h1>
          Oops, cannot redirect you.
        </h1>
        <p>
          {" "}
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
            ? error.message
            : "Unknown Error"}
        </p>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const submit = useSubmit(); // se usa en el evento ' onChange ' del ' search-form '; esto permite ir mostrando resultados dinámicamente mientras el usuario escribe
  const navigation = useNavigation();

  // se implementa ' Search Spinner ' para mejorar la experiencia del usuario
  // este componente permitirá contrarrestar el efecto de delay entre que el usuario escribe y se carga la info. de los contactos coincidentes
  const searching = navigation.location && new URLSearchParams( // esta var. verifica si estamos en estado de búsqueda
    navigation.location.search // qué contiene ' navigation.location ': en caso de que se detecte un estado de búsqueda => la próxima dirección mientras se carga la info.; caso contrario => undefined
  ).has("q");

  useEffect( () => { // esta fn. hará que se sincronice la entrada de búsqueda con la barra de navegación ante cualquier retroceso o avance con las flechas
    const searchField = document.getElementById("q"); // accedemos a controlar el input ' q '
    if(searchField instanceof HTMLInputElement){ // se verifica que efectivamente se recuperó el elemento input esperado
      searchField.value = q || "";
    }
  }, [q] );
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
            <Form 
              id="search-form" 
              role="search" 
              onChange={(event) => {
                  const isFirstSearch = q === null; // se añade para evitar el problema del historial (ver ' Managing the History Stack ' en la documentación de Remix)
                  submit(event.currentTarget, {
                    replace: !isFirstSearch, // ver ' replace ' en documentación
                  });
                }
              }
            >
              <input // Como no le seteamos ningún método, el form por defecto adquiere ' get ', ende dispara la fn. ' loader() '
                id="q"
                className={searching? "loading" : ""}
                aria-label="Search contacts"
                placeholder="Search contact"
                type="search"
                name="q"
                defaultValue={ q || "" }
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Link to ="contacts/create" className="buttonLink">Create</Link>
          </div>
          <nav> 
            {contacts.length ? ( // Se reemplaza la lista estática original propuesta, por la siguiente dinámica, finalmente se lleva a cabo el mapeo con cada dato ficticio recuperado
                <ul>             
                  {contacts.map((contact: any) => ( // obs: a partir de la línea que contiene la etiqueta "Link" se renderiza cada url asociada (de ahí el hecho que cada vez que clickeamos en un contacto diferente, la dirección se actualiza y aparecerá ' https://.../contacts/steve ', ' https://.../contacts/dorian ', etc)
                    <li key={contact.id}> 
                      <NavLink to={`contacts/${contact.id}`}
                        className={({ isActive, isPending}) => // se implementa efecto en items, ' active ' para los seleccionados, "" para los que no, y ' pending ' a los seleccionados que están siendo cargados
                          isActive ? "active" : isPending ? "pending" : ""
                        }
                      > 
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
                      </NavLink>
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
