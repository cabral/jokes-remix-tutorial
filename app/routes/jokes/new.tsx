import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useTransition,
} from "@remix-run/react";
import type { ErrorResult, UnpackData } from "domain-functions";
import { inputFromFormData } from "domain-functions";
import { inputFromForm } from "domain-functions";

import { JokeDisplay } from "~/components/joke";
import { getUserId } from "~/utils/session.server";
import { createJoke, jokeSchema } from "~/domains/jokes";
import { enforceUser } from "~/domains/user";
import { fieldHasErrors, fieldFirstMessage } from "~/utils/helpers";

export const loader: LoaderFunction = async ({ request }) => {
  const result = await enforceUser({ id: await getUserId(request) });
  if (!result.success) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json<UnpackData<typeof enforceUser>>(result.data);
};

type ActionData = ErrorResult & {
  fields?: {
    name: string;
    content: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const fields = await inputFromForm(request);
  const result = await createJoke(fields, await getUserId(request));
  if (!result.success) {
    return badRequest({ ...result });
  }
  return redirect(`/jokes/${result.data.id}?redirectTo=/jokes/new`);
};

export default () =>  {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  if (transition.submission?.formData) {
    const fields = inputFromFormData(transition.submission.formData);
    const result = jokeSchema.safeParse(fields);
    if (result.success) {
      return (
        <JokeDisplay joke={result.data} isOwner={true} canDelete={false} />
      );
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method='post'>
        <div>
          <label>
            Name:{" "}
            <input
              type='text'
              defaultValue={actionData?.fields?.name}
              name='name'
              aria-invalid={fieldHasErrors(actionData, "name")}
              aria-errormessage={
                fieldHasErrors(actionData, "name") ? "name-error" : undefined
              }
            />
          </label>
          {fieldHasErrors(actionData, "name") ? (
            <p className='form-validation-error' role='alert' id='name-error'>
              {fieldFirstMessage(actionData, "name")}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name='content'
              aria-invalid={Boolean(fieldHasErrors(actionData, "content"))}
              aria-errormessage={
                fieldHasErrors(actionData, "content")
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {fieldHasErrors(actionData, "content") ? (
            <p
              className='form-validation-error'
              role='alert'
              id='content-error'>
              {fieldFirstMessage(actionData, "content")}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.errors.length ? (
            <p className='form-validation-error' role='alert'>
              {actionData.errors.map(({ message }) => message).join(", ")}
            </p>
          ) : null}
          <button type='submit' className='button'>
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className='error-container'>
        <p>You must be logged in to create a joke.</p>
        <Link to='/login'>Login</Link>
      </div>
    );
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className='error-container'>
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
