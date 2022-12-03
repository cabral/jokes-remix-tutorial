import type {
  ActionFunction,
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, Link } from "@remix-run/react";

import { createUserSession } from "~/utils/session.server";
import stylesUrl from "~/styles/login.css";

import type { ErrorResult } from "domain-functions";
import { inputFromForm } from "domain-functions";
import { signInSignUp } from "~/domains/user";
import { fieldFirstMessage, fieldHasErrors } from "~/utils/helpers";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const meta: MetaFunction = () => {
  return {
    title: "Remix Jokes | Login",
    description: "Login to submit your own jokes to Remix Jokes!",
  };
};

type ActionData = ErrorResult & {
  fields?: { loginType: string; username: string; password: string };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

// SignInSignUp ?
export const action: ActionFunction = async ({ request }) => {
  const fields = await inputFromForm(request);
  const result = await signInSignUp(fields);
  console.log(result);
  if (!result.success) return badRequest({ ...result });
  return createUserSession(result.data.id, result.data.redirectTo);
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  return (
    <div className='container'>
      <div className='content' data-light=''>
        <h1>Login</h1>
        <form method='post'>
          <fieldset>
            <legend className='sr-only'>Login or Register?</legend>
            <label>
              <input
                type='radio'
                name='loginType'
                value='login'
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>
            <label>
              <input
                type='radio'
                name='loginType'
                value='register'
                defaultChecked={actionData?.fields?.loginType === "register"}
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor='username-input'>Username</label>
            <input
              type='text'
              id='username-input'
              name='username'
              defaultValue={actionData?.fields?.username}
              aria-invalid={fieldHasErrors(actionData, "username")}
              aria-errormessage={
                fieldHasErrors(actionData, "username")
                  ? "username-error"
                  : undefined
              }
            />
            {fieldFirstMessage(actionData, "username") ? (
              <p
                className='form-validation-error'
                role='alert'
                id='username-error'>
                {fieldFirstMessage(actionData, "username")}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor='password-input'>Password</label>
            <input
              id='password-input'
              name='password'
              defaultValue={actionData?.fields?.password}
              type='password'
              aria-invalid={
                Boolean(fieldHasErrors(actionData, "password")) || undefined
              }
              aria-errormessage={
                fieldHasErrors(actionData, "password")
                  ? "password-error"
                  : undefined
              }
            />
            {fieldFirstMessage(actionData, "password") ? (
              <p
                className='form-validation-error'
                role='alert'
                id='password-error'>
                {fieldFirstMessage(actionData, "password")}
              </p>
            ) : null}
          </div>
          <div id='form-error-message'>
            {actionData?.errors.length ? (
              <p className='form-validation-error' role='alert'>
                {actionData.errors.map(({ message }) => message).join(", ")}
              </p>
            ) : null}
          </div>
          <button type='submit' className='button'>
            Submit
          </button>
        </form>
      </div>
      <div className='links'>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/jokes'>Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
