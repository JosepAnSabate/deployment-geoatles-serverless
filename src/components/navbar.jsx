import { Link, useMatch, useResolvedPath } from "react-router-dom"
import { Auth } from "aws-amplify"
import './navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapLocation } from "@fortawesome/free-solid-svg-icons"
import ResponsiveMenu from "react-responsive-navbar";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai"; //menu

export default function Navbar() {

    async function signOut() {
        try {
            await Auth.signOut();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    return (
        <>
        <header className='header-nav'>
                <header className="logo">
                    <div className="upload-icon">
                        <Link to="/" className="site-title font-upload-logo">
                            <FontAwesomeIcon 
                                icon={faMapLocation} 
                                size="lg"
                                className="font-upload" />
                                GeoAtles
                        </Link>
                    </div>
                </header>
                <nav className="nav">
                <ResponsiveMenu
                    menuOpenButton={
                    <div className="menu hamburger-menu menu-btn">
                        <AiOutlineMenu size={32} />
                    </div>
                    }
                    menuCloseButton={
                    <div className="menu hamburger-menu menu-btn">
                        <AiOutlineClose size={32} />
                    </div>
                    }
                    changeMenuOn="600px"
                    menu={
                            <ul className='nav-list'>
                            <CustomLink to="/about" className="text-nav">About</CustomLink> 
                            <CustomLink to="/create_position" className="text-nav">Nova Posició</CustomLink> 
                            <li className='nav-button' style={{marginTop:'10px'}}><button className="sign-out text-nav" onClick={signOut}>Tanca Sessió</button></li> 
                            </ul>
                    }
                />
                </nav>
        </header>
        </>
    )
}

function CustomLink({to, children, ...props}) {
    const resolvePath = useResolvedPath(to)
    const isActive = useMatch({path: resolvePath.pathname, end: true})
    
    
    return(
        <li className={ isActive ? "active": ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    )
}