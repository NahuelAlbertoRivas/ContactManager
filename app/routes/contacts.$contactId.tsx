import { Form, useLoaderData, useRouteError, isRouteErrorResponse, useNavigate, useFetcher } from "@remix-run/react";
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import type { FunctionComponent } from "react";
import invariant from "tiny-invariant";

import type { ContactRecord } from "../data.server";

import { getContact, updateContactById } from "../data.server";

export async function loader({ params } : LoaderFunctionArgs) { // revisar acerca del objeto ' params '
    invariant(params.contactId, "Missing contactId param"); // Se instala el pack 'tiny-invariant' para facilitar el chequeo en caso de que el 'contactId' no exista, si no hacemos esta verificación, al llamar getContact() lanzaría un error
    const contactId = params.contactId;
    const contact = await getContact(contactId);
    if(!contact){ // Podría ser que no tengamos ningún contacto, entonces en esta línea verificamos eso
        throw new Response("Not found", { status: 404 }); // En caso de que no existan contactos, lanzamos un error 
    }
    return json(contact); // Si existe, retornaremos el contacto a la siguiente fn. 'Contact()', justamente en la declaración ' const contact = useLoaderData<typeof loader>(); '
  }

export async function action({ params, request } : ActionFunctionArgs){ // esta fn. manejará el comportamiento para setear el item ' favorite ' (marcar o desmarcar) de cada contacto
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData(); // nuevamente obtenemos acceso a los elementos del form
  return updateContactById(params.contactId, {
    favorite: formData.get("favorite") === "true"
  });
}

export function ErrorBoundary(){ // Implementando este componente, hacemos que la app continúe funcionalmente y no tenga un redireccionamiento abrupto a una página que muestre "Error 404..."; [básicamente podemos mostrar errores en una ruta específica]
    const error = useRouteError();
    const navigate = useNavigate();
    return (
        <div className="contact-error">
          <h1>
            Your contact has left the building.
          </h1>
          <p>
            {" "}
            {isRouteErrorResponse(error)
              ? `${error.status} ${error.statusText}`
              : error instanceof Error
              ? error.message
              : "Unknown Error"}
          </p>
          <div>
            <button onClick= { () => navigate(-1) }>Back</button>
          </div>
        </div>
    );
}

export default function Contact() {
  /* const contact = { // Este bloque es meramente de prueba, lo usamos al incio del desarrollo
    first: "Your",     // para dar forma a lo que vamos creando
    last: "Name",
    avatar: "https://placekitten.com/g/200/200",
    twitter: "your_handle",
    notes: "Some notes",
    favorite: true,
  }; */

  const contact = useLoaderData<typeof loader>(); // Recibimos el contacto existente

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a
              href={`https://twitter.com/${contact.twitter}`}
            >
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="delete" // al clickear se llama a la fn. ' action ' que definimos en el nuevo archivo designado para el método eliminar (' contacts.$contactId.delete.ts ')
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const favorite = contact.favorite;
  const fetcher = useFetcher(); // ver ' Forms Without Navigation

  return (
    <fetcher.Form method="post">
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};