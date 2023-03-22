import React from 'react';
import AppImages from '../themes/appImages';

class PdfContainer extends React.Component {
  render() {
    const bodyRef = React.createRef();
    const createPdf = () => this.props.createPdf(bodyRef.current);
    return (
      <section>
        <section className="pdf-toolbar">
          {this.props.showPdfButton && (
            <div className="container pdf-container-main-div">
              <img
                src={AppImages.printImage}
                onClick={createPdf}
                style={{ marginTop: 12, cursor: 'pointer' }}
                height="28"
                width="28"
                name={'image'}
                onError={ev => {
                  ev.target.src = AppImages.printImage;
                }}
                alt=""
              />
              {/* <Button className="primary-add-comp-form" type="primary"
                onClick={createPdf} >
                {"Download"}
              </Button> */}
            </div>
          )}
        </section>
        <section className="pdf-body" ref={bodyRef}>
          {this.props.children}
        </section>
      </section>
    );
  }
}

export default PdfContainer;

// export default (props) => {
//   const bodyRef = React.createRef();
//   const createPdf = () => props.createPdf(bodyRef.current);
//   const { createPdf1 } = this.props
//   return (
//     <section >
//       <section className="pdf-toolbar">
//         {/* <button onClick={createPdf}>Create PDF</button> */}
//       </section>
//       <section className="pdf-body" ref={bodyRef}>
//         {props.children}
//       </section>
//     </section>
//   )
// }
