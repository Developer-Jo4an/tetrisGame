import React from 'react';
import PageDescription from "../components/baseComponents/head/pageDescription/PageDescription";
import defaultPage from "../constants/page-description";
import TetrisComponent from "../components/tetrisComponent/TetrisComponent";

export default function Home() {

  return (
    <div className="container">
      <PageDescription {...defaultPage}/>
      <TetrisComponent/>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
