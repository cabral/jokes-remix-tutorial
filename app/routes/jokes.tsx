import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { UnpackResult } from "domain-functions";
import { listUserJokes } from "~/domains/jokes";
import { getUserId, logout } from "~/utils/session.server";

import stylesUrl from "~/styles/jokes.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type LoaderData = UnpackResult<typeof listUserJokes>;

export const loader: LoaderFunction = async ({ request }) => {
  const result = await listUserJokes(null, await getUserId(request));
  if (result.errors.length) throw logout(request);
  return json<LoaderData>(result);
};

export default function JokesRoute() {
  const result = useLoaderData<LoaderData>();
  const user = result.success ? result.data.user : null;
  const jokes = result.success ? result.data.jokes : [];

  // verify if jokes is empty
  return (
    <div className='jokes-layout'>
      <header className='jokes-header'>
        <div className='container'>
          <h1 className='home-link'>
            <Link
              prefetch='intent'
              to='/'
              title='Remix Jokes'
              aria-label='Remix Jokes'>
              <span className='logo'>🤪</span>
              <span className='logo-medium'>J🤪KES</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className='jokes-main'>
        <div className='container'>
          <div className='jokes-list'>
            <Link to='.'>Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {jokes.map((joke) => (
                <li key={joke.id}>
                  <Link to={joke.id}>{joke.name}</Link>
                </li>
              ))}
            </ul>
            <Link to='new' className='button'>
              Add your own
            </Link>
          </div>
          <div className='jokes-outlet'>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
