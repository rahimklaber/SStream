/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { Buffer } from 'buffer';
import CreateStream from "./components/CreateStream";
import GetStream from "./components/GetStream";
window.Buffer = Buffer;

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
    );
}
render(
    () => (
        <Router>
            <CreateStream/>
            <GetStream/>
        </Router>
    ),
    root,
);