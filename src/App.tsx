import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import Timeline from './components/Timeline/Timeline'
import Projects from './components/Projects/Projects'
import Certifications from './components/Certs/Certs'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Timeline />
        <Projects />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
