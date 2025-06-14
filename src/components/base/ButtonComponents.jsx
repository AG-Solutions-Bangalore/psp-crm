import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Delete, MessageCircle, SquarePlus, FilePenLine } from "lucide-react";

const getUserControlData = () => {
    const userControl = localStorage.getItem("userControl");
    try {
      return userControl ? JSON.parse(userControl) : [];
    } catch (error) {
      console.error("Error parsing usercontrol data from localStorage", error);
      return [];
    }
  };

  const shouldRenderButton = (buttonName, userType, status) => {
    if (!userType) {
      console.warn(`User type is ${userType} for button ${buttonName}`);
      return false;
    }
    const data = getUserControlData(); 
    if (!Array.isArray(data)) {
      console.warn("Invalid userControl data format");
      return false;
    }
    return data.some((item) => {
      if (!item?.usertype) return false;
      const userTypes = item.usertype.split(","); 
      return (
        item.button == buttonName &&
        userTypes.includes(userType) && 
        item.status.toLowerCase() == status.toLowerCase() 
      );
    });
  };
// only for action button 
  const ButtonWrapper = ({ 
    buttonName, 
    variant = "ghost", 
    size = "icon", 
    onClick, 
    className, 
    title, 
    children 
  }) => {
    const userType = localStorage.getItem("userType");
  
    if (!shouldRenderButton(buttonName, userType, "active")) return null;
  
    return (
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        className={className}
        title={title}
      >
        {children}
      </Button>
    );
  };

//   participation 

export const ParticipationMessage = ({ onClick, className }) => (
  <ButtonWrapper
    buttonName="ParticipationMessage"
    onClick={onClick}
    className={className}
    title="Open Whatsapp"
  >
    <MessageCircle className="h-4 w-4" />
  </ButtonWrapper>
);
ParticipationMessage.page = "Participant";
export const ParticipationViews = ({ onClick, className }) => (
  <ButtonWrapper
    buttonName="ParticipationViews"
    onClick={onClick}
    className={className}
    title="View"
  >
    <Eye className="h-4 w-4" />
  </ButtonWrapper>
);
ParticipationViews.page = "Participant";

export const ParticipationEdit = ({ onClick, className }) => (
  <ButtonWrapper
    buttonName="ParticipationEdit"
    onClick={onClick}
    className={className}
    title="Edit"
  >
    <Edit className="h-4 w-4" />
  </ButtonWrapper>
);
ParticipationEdit.page = "Participant";

// for create button use this 
export const ParticipationCreate = ({ onClick, className }) => {
  const userType = localStorage.getItem("userType");

  if (!shouldRenderButton("ParticipationCreate", userType, "active"))
    return null;

  return (
    <Button
    variant="default"
    onClick={onClick}
    className={` ${className}`}
    >
     <SquarePlus className="h-4 w-4" /> Participant
    </Button>
  );
};
ParticipationCreate.page = "Participant";
// for create enquiry 
export const ParticipationEnquiry = ({ onClick, className }) => {
  const userType = localStorage.getItem("userType");

  if (!shouldRenderButton("ParticipationEnquiry", userType, "active"))
    return null;

  return (
    <Button
    variant="default"
    className={` ${className}`}
    >
     <SquarePlus className="h-4 w-4" /> Enquiry
    </Button>
   
  );
};
ParticipationEnquiry.page = "Participant";
// for creating message 
export const ParticipationCrMessage = ({ onClick, className }) => {
  const userType = localStorage.getItem("userType");

  if (!shouldRenderButton("ParticipationCrMessage", userType, "active"))
    return null;

  return (
    <Button
    variant="default"
    className={` ${className}`}
    >
     <SquarePlus className="h-4 w-4" /> Message
    </Button>
   
  );
};
ParticipationCrMessage.page = "Participant";



export const PaymentEdit = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="PaymentEdit"
      onClick={onClick}
      className={className}
      title="Edit"
    >
      <Edit className="h-4 w-4" />
    </ButtonWrapper>
  );
  PaymentEdit.page = "Payment Mediation";
export const PaymentView = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="PaymentView"
      onClick={onClick}
      className={className}
      title="View"
    >
       <Eye className="h-4 w-4" />
    </ButtonWrapper>
  );
  PaymentView.page = "Payment Mediation";

  //Buisness offered


  export const BuisnessEdit = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="BuisnessEdit"
      onClick={onClick}
      className={className}
      title="Edit"
    >
      <Edit className="h-4 w-4" />
    </ButtonWrapper>
  );
  BuisnessEdit.page = "Business Expansion";
export const BuisnessView = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="BuisnessView"
      onClick={onClick}
      className={className}
      title="View"
    >
       <Eye className="h-4 w-4" />
    </ButtonWrapper>
  );
  BuisnessView.page = "Business Expansion";


  //Job Offered

  export const JobOfferedEdit = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="JobOfferedEdit"
      onClick={onClick}
      className={className}
      title="Edit"
    >
      <Edit className="h-4 w-4" />
    </ButtonWrapper>
  );
  JobOfferedEdit.page = "Job Offered";
export const JobOfferedView = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="JobOfferedView"
      onClick={onClick}
      className={className}
      title="View"
    >
       <Eye className="h-4 w-4" />
    </ButtonWrapper>
  );
  JobOfferedView.page = "Job Offered";
//   Job Require
  export const JobRequireEdit = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="JobRequireEdit"
      onClick={onClick}
      className={className}
      title="Edit"
    >
      <Edit className="h-4 w-4" />
    </ButtonWrapper>
  );
  JobRequireEdit.page = "Job Require";
export const JobRequireView = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="JobRequireView"
      onClick={onClick}
      className={className}
      title="View"
    >
       <Eye className="h-4 w-4" />
    </ButtonWrapper>
  );
  JobRequireView.page = "Job Require";


//directry 

export const DirectryView = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="DirectryView"
      onClick={onClick}
      className={className}
      title="View"
    >
       <Eye className="h-4 w-4" />
    </ButtonWrapper>
  );
  DirectryView.page = "Directory";
//Latest News


export const LatestNewsEdit = ({ onClick, className }) => (
    <ButtonWrapper
      buttonName="LatestNewsEdit"
      onClick={onClick}
      className={className}
      title="Edit News"
    >
      <FilePenLine className="h-4 w-4" />
    </ButtonWrapper>
  );
  LatestNewsEdit.page = "Latest News";



export default {
    ParticipationMessage,
    ParticipationEdit,
    ParticipationViews,
    ParticipationCreate,
    ParticipationEnquiry,
    ParticipationCrMessage,
    PaymentEdit,
    PaymentView,
    BuisnessEdit,
    BuisnessView,
    JobOfferedEdit,
    JobOfferedView,
    JobRequireEdit,
    JobRequireView,
    DirectryView,
    LatestNewsEdit,






   
  
  
  };