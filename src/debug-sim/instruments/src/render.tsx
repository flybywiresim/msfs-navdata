import React from 'react';
import ReactDOM from 'react-dom';
import { SimVarProvider } from "./common/simvars";

const reactMount = document.getElementById('MSFS_REACT_MOUNT') as HTMLElement;

export const getRenderTarget = () => reactMount;

/**
 * Use the given React element to render the instrument using React.
 */
export const render = (Slot: React.ReactElement) => {
    ReactDOM.render(<SimVarProvider>{Slot}</SimVarProvider>, getRenderTarget());
};
