import React, { useState, useEffect } from 'react';


export enum PatientInfoVisibility {
  VISIBLE = 'visible',
  VISIBLE_COLLAPSED = 'visibleCollapsed',
  DISABLED = 'disabled',
  VISIBLE_READONLY = 'visibleReadOnly',
}



function HeaderPatientInfo() {

  const [expanded, setExpanded] = useState(false);



  return (
    <div
      className="hover:bg-primary-dark flex cursor-pointer items-center justify-center gap-1 rounded-lg"
      onClick={()=>{}}
    >

    </div>
  );
}

export default HeaderPatientInfo;
