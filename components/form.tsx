import hyttpo from 'hyttpo';
import { createRef, LegacyRef, useEffect, useState } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { useSession } from "next-auth/react"

export default function Form() {
    const recaptchaRef: LegacyRef<ReCAPTCHA> = createRef();
    const [infoAlert, setInfoAlert]: any = useState({ nothing: true });

    const { data: session, status } = useSession();

    useEffect(() => {
        const $recaptcha = document.querySelector('#g-recaptcha-response');
        if($recaptcha) $recaptcha.setAttribute("required", "required");
    })

    const clearForm = () => {
        const addUrlForm: any = document.getElementById('addUrlForm');
    
        recaptchaRef.current?.reset();
        addUrlForm?.reset();
    }
    
    const handleSubmit = async(event: any) => {
        event.preventDefault();

        if (recaptchaRef.current?.getValue()?.length === 0) return;
        const inputUrl: any = document.getElementById('inputUrl');
        let body: any = {};

        body.gcaptcha = recaptchaRef.current?.getValue();
        body.url = inputUrl?.value;

        recaptchaRef.current?.reset();

        const res = await hyttpo.request({
            method: 'POST',
            url: `${window.location.origin}/api/v1/add`,
            body: JSON.stringify(body)
        }).catch(e => e)

        if (res.status === 200) setInfoAlert({
            message: 'URL has been added!'
        });
        else setInfoAlert({ message: `Error: ${res.data.message} (${res.status})` })

        clearForm();

        return;
    }    

    return (
        <div>
            {session && (
                <>
                    { !infoAlert.nothing ? <div className="notification is-primary is-light">
                    { infoAlert.message }
                    </div> : '' } 

                    <form className="box" onSubmit={handleSubmit} id='addUrlForm'>
                        <div className="field is-boxed">
                            <input className="input is-primary" type="url" id="inputUrl" placeholder="Your URL" required/>
                        </div>

                        <div className="field is-boxed">
                            <ReCAPTCHA
                            ref={recaptchaRef}
                            size='normal'
                            sitekey={process.env.NEXT_PUBLIC_SITE_KEY || ''}
                            />
                        </div>

                        <div className="field control has-text-centered">
                            <button className="button is-primary" type='submit'>Submit</button>
                        </div>
                    </form>
                </>
            )}
        </div>
    )
}