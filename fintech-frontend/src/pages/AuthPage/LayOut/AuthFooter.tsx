export default function AuthFooter() {
    return (
        <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500 flex justify-center gap-4">
            <a href="#" className="hover:text-slate-800">
                Privacy Policy
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-slate-800">
                Terms of Service
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-slate-800">
                Security Centre
            </a>
            <span className="text-slate-300">|</span>
            <span>© 2024 Core Bank Corp.</span>
        </footer>
    );
}
