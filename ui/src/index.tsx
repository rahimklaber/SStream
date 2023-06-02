/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { Buffer } from 'buffer';
import CreateStream from "./components/CreateStream";
import GetStream from "./components/GetStream";
import { Container, Nav, NavDropdown, Navbar } from 'solid-bootstrap';
import Connect from './components/Connect';
window.Buffer = Buffer;

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
    );
}
render(
    () => (
        <div>
            <Navbar bg='light'>
                <Container>
                    <Navbar.Brand href="#home">SStream</Navbar.Brand>
                    <Connect/>
                </Container>
            </Navbar>
            <Router>
                <CreateStream />
                <GetStream />
            </Router>
        </div>
    ),
    root,
);