import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import type { UnpackData } from "domain-functions";
import { getRandomJoke } from "~/domains/jokes";
import { getUserId } from "~/utils/session.server";

type LoaderData = UnpackData<typeof getRandomJoke>;
export function ErrorBoundary() {
  return <div className='error-container'>I did a whoopsies.</div>;
}

export const loader: LoaderFunction = async ({ request }) => {
  const result = await getRandomJoke(null, await getUserId(request));
  if (!result.success) {
    throw new Response("No jokes to be found!", { status: 404 });
  }

  return json<LoaderData>(result.data);
};

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{data.content}</p>
      <Link to={data.id}>"{data.name}" Permalink</Link>
    </div>
  );
}
