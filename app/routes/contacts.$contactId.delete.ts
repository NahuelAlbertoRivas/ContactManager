import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteContact } from "~/data.server";

export const action = async ( { params } : ActionFunctionArgs ) => { // esta fn. está pensada para que se dispare ante un clic sobre el botón ' Save ', brevemente garantiza el correcto procedimiento que se tiene que dar al hacer efectivo un update sobre cierto contacto
    invariant(params.contactId, "Missing conctactId param"); // se verifica existencia en el atributo ' contactId '
    await deleteContact(params.contactId);// esta fn. accede mediante fetch (petición) al ednpoint correspondiente al delete
    return redirect("/contacts")
}