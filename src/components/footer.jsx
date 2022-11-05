import './footer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLinkedin } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {    

    return (
        <>
        <br /><br /><br />
        <footer>   
            <div className="footer-wrap">
                <p className="copyright text-muted footer-cr" style={{textAlign: 'center'}}>Copyright &copy; Josep AnSab &nbsp;</p>
                <a  className='footer' href="https://www.linkedin.com/in/josep-andreu-sabat%C3%A9-b4b41a1b6/" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faLinkedin} size="2x" className='image-linkedin'/>
                </a>
                
            </div>
        </footer>
        </>
    )
}

