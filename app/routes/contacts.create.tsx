// Ruta asociada al nuevo elemento ' Link ' designado para crear contactos
import { useNavigate, useActionData, Form } from "@remix-run/react"; // ' useActionData ' permite ver la respuesta de la fn. ' action '
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { createContact } from "~/data.server";
import z from "zod"; // es una biblioteca que facilita validación de esquemas, particularmente para TS

export async function action({ request } : ActionFunctionArgs){ // esta fn. complementa a ' CreateContact() '
    const formData = await request.formData(); // mediante ' ActionFunctionArgs ' podemos acceder a los datos del form recuperados en el objeto ' request ' mediante el método ' formData() '
    const data = Object.fromEntries(formData); // Formateamos la información
    // Entonces, será posible hacer una ' api call ' para guardar la información a una BD usando Strapi

    const formSchema = z.object({ // usaremos ' zod ' para verificar el valor enviado en determinado/s atributo/s
            avatar: z.string().url().min(2), // comprobamos que el atributo contenga un string, sea un url, y tenga mínimo 2 caracteres (ende no se admitirá que quede vacío)
            first: z.string().min(2),
            last: z.string().min(2),
            twitter: z.string().min(2),
    });

    const validatedFields = formSchema.safeParse({ // acá se agrega los campos que queramos verificar
        avatar: data.avatar, // especificamos de dónde proviene, en este caso de ' formData '
        first: data.first,
        last: data.last,
        twitter: data.twitter,
    });

    if(!validatedFields.success){// verificamos los campos validados (' validatedFields ')
        return json({
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Please, fill out all missing fields.",
            data: null,
        });
    }

    const newEntry = await createContact(data);
    // return newEntry; // Dado a que queremos redireccionar al usuario hacia el nuevo contacto creado, dejamos sin efecto este retorno
    return redirect("/contacts/" + newEntry.id);
}
// complementar razonamiento interactuando en la sig. pág.: https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_form_method
export default function CreateContact(){ // luego de imlementar esta fn., junto a ' action() ', y habiendo otorgado permiso al usuario desde Strapi sobre ' create ', finalmente añadimos la funcionalidad que permitirá al user crear contactos desde su interfaz
    const navigate = useNavigate();
    const formData = useActionData<typeof action>();

    console.log(formData, "data from action");

    return( // " cuando sea que no se defina una acción para el Form, donde sea que éste se envíe va a buscar la acción (o bien ' action ' en el contexto dado) declarada más cercana que tengamos en el mismo archivo
        <Form method="post"> 
            <div className="create-form-grid">
                <FormInput
                    aria-label="First name"
                    name="first"
                    type="text"
                    label="First name"
                    placeholder="First"
                    errors={formData?.errors} /* se chequea si está indefinido o no tiene errores, entonces retorna false */
                /> 
                <FormInput
                    aria-label="Last name"
                    name="last"
                    type="text"
                    label="Last name"
                    placeholder="Last"
                    errors={formData?.errors} /* entonces, a partir de añadir estas líneas cada vez que no se cumplan las condiciones establecidas mediante zod, el usuario visualizará el error correspondiente en cada campo */
                />
                <FormInput
                    name="twitter"
                    type="text"
                    label="Twitter"
                    placeholder="@user"
                    errors={formData?.errors}
                />
                <FormInput
                    aria-label="Avatar URL"
                    name="avatar"
                    type="text"
                    label="Avatar URL"
                    placeholder="https://example.com/avatar.jpg"
                    errors={formData?.errors}
                />
            </div>
            <div>
                <label>
                    <span>Notes</span>
                    <textarea name="note" rows={6} />
                </label>
            </div>

            <div className="button-group">
                <button type="submit">Create</button>
                <button type="button" onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </div>
        </Form>
    );
}

function FormInput({
    type,
    name,
    label,
    placeholder,
    defaultValue = "",
    errors,
}: Readonly<{
    type: string,
    name: string,
    label?: string,
    placeholder?: string,
    errors: any,
    defaultValue?: string,
}>) {
    return (
        <div className="input-field">
            <div>
                <label htmlFor={name}>{label}</label>
                <div>
                    <input
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        defaultValue={defaultValue}
                    />
                </div>
            </div>
            <ul>
                {errors && errors[name]
                    ? errors[name].map((error: string) => (
                        <li key={error} className="input-error">
                            {error}
                        </li>
                    ))
                : null}
            </ul>
        </div>
    );
}