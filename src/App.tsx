import Nav from './components/Nav/Nav'
import ScrollProgress from './components/ui/ScrollProgress'
import Hero from './components/Hero/Hero'
import Timeline from './components/Timeline/Timeline'
import Projects from './components/Projects/Projects'
import Certifications from './components/Certs/Certs'
import Skills from './components/Skills/Skills'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollProgress />
      <Nav />
      <main id="main">
        <Hero />
        <Timeline />
        <Projects />
        <Certifications />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
