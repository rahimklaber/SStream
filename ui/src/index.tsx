/* @refresh reload */
import { render } from 'solid-js/web';
import { Route, Router, Routes, hashIntegration } from '@solidjs/router';
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
        <Router source={hashIntegration()}>
            <div>
                <Navbar bg='light'>
                    <Container>
                        <Navbar.Brand href="/#/">SStream</Navbar.Brand>
                        <Nav class="me-auto">
                            <Nav.Link href="#/lookup">Lookup Stream</Nav.Link>
                            <Nav.Link href="#/create">Create Stream</Nav.Link>
                        </Nav>
                        <Connect />
                    </Container>
                </Navbar>
                <div class='mt-5'>
                    <Routes>
                        <Route path="/" component={GetStream} />
                        <Route path="/lookup" component={GetStream} />

                        <Route path="/create" component={CreateStream} />
                    </Routes>
                </div>
            </div>
        </Router>
    ),
    root,
);