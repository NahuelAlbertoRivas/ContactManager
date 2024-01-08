import { type LoaderFunctionArgs, json, ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact, updateContactById } from "~/data.server";

export const loader = async ({ // nuevamente, esta fn. recuperará la info. de Strapi
    params,
}: LoaderFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param"); // como verificamos la existencia de ' contactId ' en la fn. ' loader() ' de ' contacts.$contacId.tsx ' mediante invariant, hacemos lo mismo nuevamente acá
    const contact = await getContact(params.contactId);
    if(!contact) throw new Response("Not found", { status: 404 });
    return json({ contact });
};

export const action = async ( { params, request } : ActionFunctionArgs ) => {
    invariant(params.contactId, "Missing conctactId param");
    const formData = await request.formData();
    const data = Object.fromEntries(formData); // este método, recuperado del pertinente objeto aludido, permitirá desestructurar la información recuperada del form (guardada en ' formData ')
    
    const updateResponse = await updateContactById(params.contactId, data);// fn. para manejar una acción consecuente de haber actualizado
    
    if(updateResponse.error) return json({ // para tener esta respuesta, deberíamos usar ' useActionData() ' 
        data: null,
        error: updateResponse.error,
    })
    console.log(params.conctactId);
    return redirect("/contacts/" + params.contactId)
    // return null; // [esta línea se agregó en primer instancia previa al redireccionamiento] al parecer, al definir una fn. ' action ' asociada a forms, siempre se espera un retorno, en este caso como no hay nada en particular que devolver simplemente retornamos null
}

export default function EditContact(){
    const { contact } = useLoaderData<typeof loader>(); // recuperamos la info. como objeto, con cada atributo existente
    const formResponse = useActionData<typeof action>();

    console.log(formResponse, "from action");

    return( // lógicamente, por defecto dejamos los valores que tenían los campos inicialmente
        <Form id="contact-form" method="post">
            <p>
                <span>Name</span>
                <input
                    defaultValue={contact.first}
                    aria-label="First name"
                    name="first"
                    type="text"
                    placeholder="First"
                />
                <input
                    defaultValue={contact.last}
                    aria-label="Last name"
                    name="last"
                    type="text"
                    placeholder="Last"
                />
            </p>
            <label>
                <span>Twitter</span>
                <input
                    defaultValue={contact.twitter}
                    name="twitter"
                    placeholder="@user"
                    type="text"
                />
            </label>
            <label>
                <span>Avatar URL</span>
                <input
                    aria-label="Avatar URL"
                    defaultValue={contact.avatar}
                    name="avatar"
                    placeholder="https://example.com/avatar.jpg"
                    type="text"
                />
            </label>
            <label>
                <span>Notes</span>
                <textarea
                    defaultValue={contact.notes}
                    name="notes"
                    rows={6}
                />
            </label>
            <p> 
                <button type="submit">Save</button> 
                <button type="button">Cancel</button>
            </p>
        </Form> // nuevamente, como el botón ' Save ' es del tipo ' submit ', automáticamente ejecutará la fn. ' action ' que definamos
    );
}