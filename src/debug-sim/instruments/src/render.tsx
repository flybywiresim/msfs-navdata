import ReactDOM from 'react-dom';

const reactMount = document.getElementById('MSFS_REACT_MOUNT') as HTMLElement;

export const getRenderTarget = () => reactMount;

/**
 * Use the given React element to render the instrument using React.
 */
export const render = (Slot: React.ReactElement) => {
    ReactDOM.render(Slot, getRenderTarget());
};
