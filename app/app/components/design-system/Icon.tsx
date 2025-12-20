import {
    MdVisibility,
    MdEdit,
    MdAdd,
    MdCalendarToday,
    MdLocationOn,
    MdWorkspacePremium,
    MdPeople,
    MdEmail,
    MdHelp,
    MdCheck,
    MdDelete,
    MdLogout,
    MdHome,
    MdPerson,
    MdExitToApp,
    MdDescription,
    MdClose,
    MdArrowBack,
    MdCancel,
    MdArrowForward,
    MdSend,
    MdChat,
    MdKeyboardArrowDown,
} from 'react-icons/md';

interface IconProps {
    name: 'eye' | 'edit' | 'plus' | 'calendar' | 'location' | 'crown' | 'users' | 'envelope' | 'question' | 'check' | 'trash' | 'logout' | 'home' | 'user' | 'leave' | 'document' | 'close' | 'arrowBack' | 'decline' | 'arrowForward' | 'send' | 'chat' | 'chevronDown';
    className?: string;
    size?: number;
    text?: string;
}

const icons = {
    eye: MdVisibility,
    edit: MdEdit,
    plus: MdAdd,
    calendar: MdCalendarToday,
    location: MdLocationOn,
    crown: MdWorkspacePremium,
    users: MdPeople,
    envelope: MdEmail,
    question: MdHelp,
    check: MdCheck,
    trash: MdDelete,
    logout: MdLogout,
    home: MdHome,
    user: MdPerson,
    leave: MdExitToApp,
    document: MdDescription,
    close: MdClose,
    arrowBack: MdArrowBack,
    decline: MdCancel,
    arrowForward: MdArrowForward,
    send: MdSend,
    chat: MdChat,
    chevronDown: MdKeyboardArrowDown,
};

export function Icon({ name, className = '', size = 24, text }: IconProps) {
    const IconComponent = icons[name];
    return (
        <span className={`inline-flex items-center justify-center align-middle gap-2 ${className}`}>
            <IconComponent size={size} />
            {text && <span className="text-sm font-medium leading-none">{text}</span>}
        </span>
    );
}