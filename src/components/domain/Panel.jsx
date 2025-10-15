import React, { useState } from "react";
import useAvisos from "@/hooks/useAvisos";
import ModalAvisos from "./ModalAvisos";
import BotonAvisos from "../shared/BotonAvisos";

const Panel = () => {
  const { avisos, recargar, eliminarAviso } = useAvisos();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      {!modalVisible && (
        <BotonAvisos
          cantidad={avisos.length}
          onClick={() => setModalVisible(true)}
        />
      )}
      <ModalAvisos
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        avisos={avisos}
        recargar={recargar}
        eliminarAviso={eliminarAviso}
      />
    </>
  );
};

export default Panel;
