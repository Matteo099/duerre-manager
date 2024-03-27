import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const toastr = () => {
    return {
        ...Vue3Toastify,
        ...{
            autoClose: 3000,
        } as ToastContainerOptions
    }
}

export default toastr